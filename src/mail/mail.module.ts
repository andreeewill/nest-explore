import { Global, Module } from '@nestjs/common';
import { MailService } from './provider/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EjsAdapter as Ejs } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import path from 'path';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('appConfig.mailHost'),
          secure: false,
          port: 2525,
          auth: {
            user: configService.get('appConfig.smtpUsername'),
            pass: configService.get('appConfig.smtpPassword'),
          },
        },
        defaults: {
          from: `My blog <no-reply@nestjs-blog.com>`,
        },
        template: {
          dir: path.join(__dirname, 'templates'),
          adapter: new Ejs({
            inlineCssEnabled: true,
          }),
          options: {
            strict: false,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
