import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { McpModule } from './mcp/mcp.module';
import { ConfigModule } from '@nestjs/config';
console.log("注入环境变量");
console.log(process.env.NODE_ENV);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局模块
      envFilePath: `${(process.env.NODE_ENV || '')?'.'+process.env.NODE_ENV:''}.env`, // 根据环境加载文件
    }),
    McpModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
