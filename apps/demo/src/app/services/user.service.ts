import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http
      .get<User[]>('https://jsonplaceholder.typicode.com/users')
      .pipe(map((users) => this.expandUserData(users)));
  }

  private expandUserData(users: User[]): User[] {
    return Array(50)
      .fill(null)
      .flatMap((_, i) =>
        users.map((user) => ({
          ...user,
          id: user.id + i * users.length,
        })),
      );
  }
}
