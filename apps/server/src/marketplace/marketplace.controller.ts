import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingQueryDto } from './dto/listing-query.dto';
import { ok } from '../common/utils/api-response';

@UseGuards(AuthGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  // ─── Listings ────────────────────────────────────────────────────────────────

  @Get('listings')
  async findListings(@Query() query: ListingQueryDto) {
    const result = await this.service.findListings(query);
    return ok(result.items, { total: result.total, limit: result.limit, offset: result.offset });
  }

  @Get('listings/my')
  async findMyListings(@Request() req: any) {
    const data = await this.service.findMyListings(req.user.sub);
    return ok(data);
  }

  @Get('listings/:id')
  async findListing(@Param('id') id: string) {
    const data = await this.service.findListingById(id);
    return ok(data);
  }

  @Post('listings')
  async createListing(@Request() req: any, @Body() body: CreateListingDto) {
    const data = await this.service.createListing(req.user.sub, body);
    return ok(data);
  }

  @Patch('listings/:id')
  async updateListing(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: UpdateListingDto,
  ) {
    const data = await this.service.updateListing(id, req.user.sub, body);
    return ok(data);
  }

  @Delete('listings/:id')
  async deleteListing(@Param('id') id: string, @Request() req: any) {
    const data = await this.service.deleteListing(id, req.user.sub);
    return ok(data);
  }

  // ─── Bookmarks ───────────────────────────────────────────────────────────────

  @Post('bookmarks/:listingId')
  async toggleBookmark(@Param('listingId') listingId: string, @Request() req: any) {
    const data = await this.service.toggleBookmark(req.user.sub, listingId);
    return ok(data);
  }

  @Get('bookmarks')
  async getBookmarks(@Request() req: any) {
    const data = await this.service.getBookmarks(req.user.sub);
    return ok(data);
  }

  @Get('bookmarks/ids')
  async getBookmarkedIds(@Request() req: any) {
    const data = await this.service.getBookmarkedIds(req.user.sub);
    return ok(data);
  }

  // ─── Chats ───────────────────────────────────────────────────────────────────

  @Post('chats/listing/:listingId')
  async getOrCreateChat(@Param('listingId') listingId: string, @Request() req: any) {
    const data = await this.service.getOrCreateChat(listingId, req.user.sub);
    return ok(data);
  }

  @Get('chats')
  async getMyChats(@Request() req: any) {
    const data = await this.service.getMyChats(req.user.sub);
    return ok(data);
  }

  @Get('chats/:chatId/messages')
  async getChatMessages(@Param('chatId') chatId: string, @Request() req: any) {
    const data = await this.service.getChatMessages(chatId, req.user.sub);
    return ok(data);
  }

  @Post('chats/:chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Request() req: any,
    @Body('text') text: string,
  ) {
    const data = await this.service.sendMessage(chatId, req.user.sub, text);
    return ok(data);
  }
}
