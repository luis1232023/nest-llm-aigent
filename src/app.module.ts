import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpModule } from './mcp/mcp.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // 根据环境加载文件
    }),
    McpModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
