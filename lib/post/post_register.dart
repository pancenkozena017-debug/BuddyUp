import 'dart:convert';

import 'package:buddy_up/firebase.dart';
import 'package:shelf/shelf.dart';
import 'package:buddy_up/server.dart';

Future<void> register(FirebaseService firebaseService) async {
  app.post('/register', (Request req) async {
    try {
      final email = req.url.queryParameters['email'];
      final password = req.url.queryParameters['password'];
      final name = req.url.queryParameters['name'];
      final surname = req.url.queryParameters['surname'];
      final phone = req.url.queryParameters['phone'];
      final birthday = req.url.queryParameters['birthday'];
      final telegramUsername = req.url.queryParameters['telegramUsername'];
      final photo = req.url.queryParameters['photo']??'aboba';

      final missing = <String>[];
      if (email == null) missing.add('email');
      if (password == null) missing.add('password');
      if (name == null) missing.add('name');
      if (surname == null) missing.add('surname');
      if (phone == null) missing.add('phone');
      if (birthday == null) missing.add('birthday');
      if (telegramUsername == null) missing.add('telegramUsername');

      if (missing.isNotEmpty) {
        return Response(
          400,
          body: jsonEncode({'error': 'Missing fields: $missing'}),
          headers: {'Content-Type': 'application/json'},
        );
      }

      final result = await firebaseService.registerUser(
        email!,
        password!,
        name!,
        surname!,
        phone!,
        telegramUsername!,
        birthday!,
        photo,
      );

      return Response.ok(
        jsonEncode({'message': 'Registered successfully!', 'data': result}), 
        headers: {'Content-Type': 'application/json'},
      );
    } catch (e) {
      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'Content-Type': 'application/json'},
      );
    }
  });
}
