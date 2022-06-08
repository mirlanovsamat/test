import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ){}

  async create(createUserDto: CreateUserDto) {
    const newUser = await this.userModel.findOne({email: createUserDto.email})
    if(newUser) {
      throw new HttpException('Пользователь с такой почтой уже существует', HttpStatus.BAD_REQUEST)
    }
    const hashPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = await new this.userModel({...createUserDto, password: hashPassword}).save()
    const token = await this.generateJwt(user)
    return {user, token}
  } 
  
  async login(loginUserDto: LoginUserDto) {
    const user = await this.userModel.findOne({email: loginUserDto.email});
    const comparePassword = await bcrypt.compare(loginUserDto.password, user.password)
    if(!comparePassword || !user) {
      throw new HttpException('Пользователь с такой почтой не существует или неправильный пароль', HttpStatus.BAD_REQUEST)
    }
    
    const token = await this.generateJwt(user)
    return {user, token}
  }

  async findAll() {
    const users = await this.userModel.find().exec();
    const token = await this.generateJwt(users)
    return {users, token}
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).exec();
    const token = await this.generateJwt(user)
    return {user, token}
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto).exec()
    const token = await this.generateJwt(user)
    return {user, token}
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    const token = await this.generateJwt(user)
    return {user, token}
  }

  async generateJwt(user) {
    return await jwt.sign(
      {id: user.id, email: user.email, age: user.age},
      process.env.JWT_ACCESS_TOKEN,
      {expiresIn: '15m'}
    )
  }
}
