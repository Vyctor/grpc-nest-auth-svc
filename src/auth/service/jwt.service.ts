import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../auth.entity';
import { JwtService as Jwt } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

@Injectable()
export class JwtService {
  @InjectRepository(Auth)
  private readonly authRepository: Repository<Auth>;

  private readonly jwt: Jwt;

  constructor(jwt: Jwt) {
    this.jwt = jwt;
  }

  public async decode(token: string): Promise<unknown> {
    return this.jwt.decode(token, null);
  }

  public async validateUser(decoded: any): Promise<Auth> {
    return this.authRepository.findOne(decoded.id);
  }

  public generateToken(auth: Auth): string {
    return this.jwt.sign({ id: auth.id, email: auth.email });
  }

  public isPasswordValid(password: string, userPassword: string): boolean {
    return compareSync(password, userPassword);
  }

  public encodePassword(password: string): string {
    const salt: string = genSaltSync(10);

    return hashSync(password, salt);
  }

  public async verify(token: string): Promise<any> {
    try {
      return this.jwt.verify(token);
    } catch (error) {
      throw new UnauthorizedException(error, error.message);
    }
  }
}
