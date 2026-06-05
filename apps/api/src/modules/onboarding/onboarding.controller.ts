import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOperatorOnboardingDto } from './dto/create-operator-onboarding.dto';
import { CreatePartnerOnboardingDto } from './dto/create-partner-onboarding.dto';
import { OnboardingService } from './onboarding.service';

@ApiTags('Onboarding')
@Controller({
  path: 'onboarding',
  version: '1',
})
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @ApiOperation({ summary: 'Iniciar onboarding de uma operadora' })
  @Post('operators')
  createOperator(@Body() payload: CreateOperatorOnboardingDto) {
    return this.onboardingService.createOperator(payload);
  }

  @ApiOperation({ summary: 'Iniciar onboarding de um partner' })
  @Post('partners')
  createPartner(@Body() payload: CreatePartnerOnboardingDto) {
    return this.onboardingService.createPartner(payload);
  }
}
