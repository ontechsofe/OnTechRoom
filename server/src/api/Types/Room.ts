import {JSONSchema} from "class-validator-jsonschema";
import {IsArray, IsNumber, IsString} from "class-validator";

@JSONSchema({
    description: 'A Room Object',
    example: {
        id: '',
        name: '',
        imageURL: '',
        facilities: [
            ''
        ],
        floor: 0,
        capacity: 0,
        minRequired: 0,
        maxDuration: 0
    }
})
export class Room {
    @IsString()
    @JSONSchema({
        description: 'The Room ID',
        format: 'LIB####'
    })
    public id: string;
    @IsString()
    public name: string;
    @IsString()
    public imageURL: string;
    @IsArray()
    public facilities: string[];
    @IsNumber()
    public floor: number;
    @IsNumber()
    public capacity: number;
    @IsNumber()
    public minRequired: number;
    @IsNumber()
    public maxDuration: number;
}
