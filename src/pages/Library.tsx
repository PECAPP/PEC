import { useState, useEffect } from 'react';
import { Book, BookOpen, Search, Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
} from '@/lib/dataClient';
import { Book as BookType, BookBorrow } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Library() {
  const { user } = useAuth();
  const { role } = usePermissions();
  const isAdmin = role === 'college_admin';
  
  const [books, setBooks] = useState<BookType[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BookBorrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    totalCopies: 1,
    availableCopies: 1,
    publisher: '',
    year: new Date().getFullYear(),
    location: '',
  });

  // Fetch books
  useEffect(() => {
    const booksRef = collection(({} as any), 'books');
    const unsubscribe = onSnapshot(
      query(booksRef, orderBy('title')),
      (snapshot) => {
        const booksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BookType[];
        setBooks(booksData);

        const uniqueCategories = Array.from(
          new Set(booksData.map((b) => b.category))
        );
        setCategories(uniqueCategories);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Fetch borrowed books for current user (students only)
  useEffect(() => {
    if (!user || isAdmin) return;

    const borrowsRef = collection(({} as any), 'bookBorrows');
    const unsubscribe = onSnapshot(
      query(
        borrowsRef,
        where('userId', '==', user.uid),
        where('status', '==', 'borrowed')
      ),
      (snapshot) => {
        const borrowsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BookBorrow[];
        setBorrowedBooks(borrowsData);
      }
    );

    return unsubscribe;
  }, [user, isAdmin]);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddBook = async () => {
    if (!isAdmin) {
      toast.error('You do not have permission to add books');
      return;
    }

    try {
      await addDoc(collection(({} as any), 'books'), {
        ...newBook,
        availableCopies: newBook.totalCopies,
        createdAt: new Date(),
      });
      toast.success('Book added successfully');
      resetForm();
      setOpenAddDialog(false);
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
    }
  };

  const handleUpdateBook = async () => {
    if (!isAdmin || !editingBook) return;

    try {
      const updateData = { ...newBook };
      
      // Recalculate availableCopies if totalCopies changed
      if (editingBook.totalCopies !== newBook.totalCopies) {
        const copiesDiff = newBook.totalCopies - editingBook.totalCopies;
        (updateData as any).availableCopies = editingBook.availableCopies + copiesDiff;
      } else {
        // Keep existing availableCopies if totalCopies didn't change
        (updateData as any).availableCopies = editingBook.availableCopies;
      }

      await updateDoc(doc(({} as any), 'books', editingBook.id), updateData);
      toast.success('Book updated successfully');
      resetForm();
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!isAdmin) {
      toast.error('You do not have permission to delete books');
      return;
    }

    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      await deleteDoc(doc(({} as any), 'books', bookId));
      toast.success('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const resetForm = () => {
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      category: '',
      totalCopies: 1,
      availableCopies: 1,
      publisher: '',
      year: new Date().getFullYear(),
      location: '',
    });
    setEditingBook(null);
  };

  const handleBorrowBook = async (bookId: string) => {
    if (!user || isAdmin) {
      if (isAdmin) toast.error('Only students and faculty can borrow books');
      else toast.error('Please log in to borrow books');
      return;
    }

    try {
      const book = books.find((b) => b.id === bookId);
      if (!book || book.availableCopies <= 0) {
        toast.error('This book is not available');
        return;
      }

      // Create borrow record
      await addDoc(collection(({} as any), 'bookBorrows'), {
        bookId,
        userId: user.uid,
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        status: 'borrowed',
      });

      // Update available copies
      await updateDoc(doc(({} as any), 'books', bookId), {
        availableCopies: book.availableCopies - 1,
      });

      toast.success('Book borrowed successfully. Due in 2 weeks.');
    } catch (error) {
      console.error('Error borrowing book:', error);
      toast.error('Failed to borrow book');
    }
  };

  const handleReturnBook = async (borrowId: string) => {
    try {
      const borrow = borrowedBooks.find((b) => b.id === borrowId);
      if (!borrow) return;

      // Update borrow record
      await updateDoc(doc(({} as any), 'bookBorrows', borrowId), {
        returnDate: new Date(),
        status: 'returned',
      });

      // Update available copies
      const book = books.find((b) => b.id === borrow.bookId);
      if (book) {
        await updateDoc(doc(({} as any), 'books', borrow.bookId), {
          availableCopies: book.availableCopies + 1,
        });
      }

      toast.success('Book returned successfully');
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error('Failed to return book');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ADMIN VIEW */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Library Management</h1>
            </div>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                </DialogHeader>
                <BookForm newBook={newBook} setNewBook={setNewBook} onSubmit={handleAddBook} submitLabel="Add Book" />
              </DialogContent>
            </Dialog>
          </div>

          {/* Books Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Author</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Available</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-3 text-sm">{book.title}</td>
                    <td className="px-6 py-3 text-sm">{book.author}</td>
                    <td className="px-6 py-3 text-sm">{book.category}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className={book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}>
                        {book.availableCopies}/{book.totalCopies}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm flex gap-2">
                      <Dialog open={openEditDialog && editingBook?.id === book.id} onOpenChange={(open) => {
                        if (open) {
                          setEditingBook(book);
                          setNewBook({
                            title: book.title,
                            author: book.author,
                            isbn: book.isbn,
                            category: book.category,
                            totalCopies: book.totalCopies,
                            availableCopies: book.availableCopies,
                            publisher: book.publisher,
                            year: book.year,
                            location: book.location,
                          });
                        }
                        setOpenEditDialog(open);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Book</DialogTitle>
                          </DialogHeader>
                          <BookForm newBook={newBook} setNewBook={setNewBook} onSubmit={handleUpdateBook} submitLabel="Update Book" />
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() => handleDeleteBook(book.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STUDENT/FACULTY VIEW */}
      {!isAdmin && (
        <div className="space-y-6">
          {/* Student Header */}
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Library</h1>
          </div>

          {/* Borrowed Books Section */}
          {borrowedBooks.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Book className="w-4 h-4" />
                Currently Borrowed ({borrowedBooks.length})
              </h3>
              <div className="space-y-2">
                {borrowedBooks.map((borrow) => (
                  <div
                    key={borrow.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded"
                  >
                    <div>
                      <p className="font-medium">{books.find(b => b.id === borrow.bookId)?.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {new Date(borrow.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReturnBook(borrow.id)}
                    >
                      Return
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search books by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{book.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {book.author}
                    </p>
                  </div>
                  <Book className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>

                <div className="space-y-1 text-sm mb-3">
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">ISBN:</span>{' '}
                    {book.isbn}
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">
                      Category:
                    </span>{' '}
                    {book.category}
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">
                      Publisher:
                    </span>{' '}
                    {book.publisher}
                  </p>
                  <p>
                    <span className="text-gray-600 dark:text-gray-400">
                      Available:
                    </span>{' '}
                    <span
                      className={
                        book.availableCopies > 0
                          ? 'text-green-600 dark:text-green-400 font-semibold'
                          : 'text-red-600 dark:text-red-400 font-semibold'
                      }
                    >
                      {book.availableCopies}/{book.totalCopies}
                    </span>
                  </p>
                </div>

                <Button
                  onClick={() => handleBorrowBook(book.id)}
                  disabled={book.availableCopies === 0}
                  className="w-full"
                >
                  Borrow
                </Button>
              </div>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No books found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BookForm({ newBook, setNewBook, onSubmit, submitLabel }: any) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Book Title"
        value={newBook.title}
        onChange={(e) =>
          setNewBook({ ...newBook, title: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-lg"
      />
      <input
        type="text"
        placeholder="Author"
        value={newBook.author}
        onChange={(e) =>
          setNewBook({ ...newBook, author: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-lg"
      />
      <input
        type="text"
        placeholder="ISBN"
        value={newBook.isbn}
        onChange={(e) =>
          setNewBook({ ...newBook, isbn: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-lg"
      />
      <input
        type="text"
        placeholder="Category"
        value={newBook.category}
        onChange={(e) =>
          setNewBook({ ...newBook, category: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-lg"
      />
      <input
        type="text"
        placeholder="Publisher"
        value={newBook.publisher}
        onChange={(e) =>
          setNewBook({ ...newBook, publisher: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-lg"
      />
      <input
        type="number"
        placeholder="Total Copies"
        value={newBook.totalCopies}
        onChange={(e) =>
          setNewBook({
            ...newBook,
            totalCopies: parseInt(e.target.value) || 1,
          })
        }
        className="w-full px-3 py-2 border rounded-lg"
      />
      <input
        type="text"
        placeholder="Location"
        value={newBook.location}
        onChange={(e) =>
          setNewBook({ ...newBook, location: e.target.value })
        }
        className="w-full px-3 py-2 border rounded-lg"
      />
      <Button
        onClick={onSubmit}
        className="w-full"
      >
        {submitLabel}
      </Button>
    </div>
  );
}
