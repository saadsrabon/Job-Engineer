import { Controller, Get, Patch, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@jobos/database';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('users')
export class UsersController {
  constructor(@Inject(UsersService) private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: User) {
    return { data: user };
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto).then((data) => ({ data }));
  }

  @Patch('me/onboarding')
  completeOnboarding(@CurrentUser() user: User) {
    return this.usersService.completeOnboarding(user.id).then((data) => ({ data }));
  }
}
