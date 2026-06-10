import { redirect } from 'next/navigation';

export default function DirectoryIndex() {
  redirect('/directory/users');
}
