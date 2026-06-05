import { Injectable } from '@nestjs/common';
import { MarketplaceRepository } from './marketplace.repository';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingQueryDto } from './dto/listing-query.dto';

@Injectable()
export class MarketplaceService {
  constructor(private readonly repo: MarketplaceRepository) {}

  findListings(query: ListingQueryDto) { return this.repo.findListings(query); }
  findListingById(id: string) { return this.repo.findListingById(id); }
  findMyListings(sellerId: string) { return this.repo.findMyListings(sellerId); }
  createListing(sellerId: string, data: CreateListingDto) { return this.repo.createListing(sellerId, data); }
  updateListing(id: string, userId: string, data: UpdateListingDto) { return this.repo.updateListing(id, userId, data); }
  deleteListing(id: string, userId: string) { return this.repo.deleteListing(id, userId); }

  toggleBookmark(userId: string, listingId: string) { return this.repo.toggleBookmark(userId, listingId); }
  getBookmarks(userId: string) { return this.repo.getBookmarks(userId); }
  getBookmarkedIds(userId: string) { return this.repo.getBookmarkedIds(userId); }

  getOrCreateChat(listingId: string, buyerId: string) { return this.repo.getOrCreateChat(listingId, buyerId); }
  getMyChats(userId: string) { return this.repo.getMyChats(userId); }
  getChatMessages(chatId: string, userId: string) { return this.repo.getChatMessages(chatId, userId); }
  sendMessage(chatId: string, senderId: string, text: string) { return this.repo.sendMessage(chatId, senderId, text); }
}
