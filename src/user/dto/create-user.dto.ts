import { IsEmail, IsNotEmpty, IsNumberString, Length } from "class-validator";

export class CreateUserDto {

    @IsNotEmpty()
    readonly name: string;

    @IsNotEmpty()
    @IsNumberString()
    readonly age: number;

    @IsNotEmpty()
    @IsEmail({message: 'Email should be email'})
    readonly email: string;

    @IsNotEmpty()
    @Length(6, 16, {
        message: 'Passwords length should be less than 16 and more than 6',
    })
    readonly password: string;
}
