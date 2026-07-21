import { Controller, Post, Req, Headers, RawBodyRequest, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Webhook } from 'svix';
import { UsersRepository } from '../users/users.repository';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private usersRepository: UsersRepository) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    const wh = new Webhook(webhookSecret);
    let evt: { type: string; data: Record<string, unknown> };

    try {
      evt = wh.verify(JSON.stringify(req.body), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as typeof evt;
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const data = evt.data;
      const emailAddresses = data.email_addresses as Array<{ email_address: string }>;
      const primaryEmail = emailAddresses?.[0]?.email_address;

      await this.usersRepository.upsertFromClerk({
        clerkId: data.id as string,
        email: primaryEmail || `${data.id}@clerk.user`,
        name: [data.first_name, data.last_name].filter(Boolean).join(' ') || null,
        avatar: (data.image_url as string) || null,
      });
    }

    return { data: { received: true } };
  }
}
