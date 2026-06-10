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
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingQueryDto } from './dto/listing-query.dto';
import { ok } from '../common/utils/api-response';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  // ─── Listings ────────────────────────────────────────────────────────────────

  @CheckPolicies((ability) => ability.can('read', 'MarketplaceListing'))
  @Get('listings')
  async findListings(@Query() query: ListingQueryDto) {
    const result = await this.service.findListings(query);
    return ok(result.items, { total: result.total, limit: result.limit, offset: result.offset });
  }

  @CheckPolicies((ability) => ability.can('read', 'MarketplaceListing'))
  @Get('listings/my')
  async findMyListings(@Request() req: any) {
    const data = await this.service.findMyListings(req.user.sub);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('read', 'MarketplaceListing'))
  @Get('listings/:id')
  async findListing(@Param('id') id: string) {
    const data = await this.service.findListingById(id);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'MarketplaceListing'))
  @Post('listings')
  async createListing(@Request() req: any, @Body() body: CreateListingDto) {
    const data = await this.service.createListing(req.user.sub, body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('update', 'MarketplaceListing'))
  @Patch('listings/:id')
  async updateListing(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: UpdateListingDto,
  ) {
    const data = await this.service.updateListing(id, req.user.sub, body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('delete', 'MarketplaceListing'))
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
  @Throttle({ short: { limit: 5, ttl: 60000 } }) // 5 messages per minute
  async sendMessage(
    @Param('chatId') chatId: string,
    @Request() req: any,
    @Body('text') text: string,
  ) {
    const data = await this.service.sendMessage(chatId, req.user.sub, text);
    return ok(data);
  }

  @Post('chats/:chatId/offers')
  async createOffer(
    @Param('chatId') chatId: string,
    @Request() req: any,
    @Body('amount') amount: number,
  ) {
    const data = await this.service.createOffer(chatId, req.user.sub, amount);
    return ok(data);
  }

  @Patch('chats/:chatId/offers/:messageId')
  async updateOffer(
    @Param('chatId') chatId: string,
    @Param('messageId') messageId: string,
    @Request() req: any,
    @Body('status') status: string,
  ) {
    const data = await this.service.updateOffer(chatId, messageId, req.user.sub, status);
    return ok(data);
  }
}
