import { Pipe, PipeTransform } from '@angular/core';
import { IMessage } from 'app/shared/model/messsage.model';

@Pipe({ name: 'MessageSearchByMessageId' })
export class MessageSearchByMessageIdPipe implements PipeTransform {
    transform(messages: IMessage[], searchText: string) {
        return messages.filter(message => message.messageid.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()));
    }
}
