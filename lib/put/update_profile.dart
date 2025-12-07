import 'dart:convert';

import 'package:buddy_up/firebase.dart';
import 'package:shelf/shelf.dart';
import 'package:buddy_up/server.dart';

Future<void> update(FirebaseService firebaseService) async {
  app.put('/update', (Request req) async {
    try {
      final id = req.url.queryParameters['id'];
      final password = req.url.queryParameters['password'];
      final name = req.url.queryParameters['name'];
      final surname = req.url.queryParameters['surname'];
      final description = req.url.queryParameters['description'];
      final phone = req.url.queryParameters['phone'];
      final birthday = req.url.queryParameters['birthday'];
      final telegramUsername = req.url.queryParameters['telegramUsername'];

      final missing = <String>[];
      if (id == null) missing.add('id');
      if (password == null) missing.add('password');
      if (name == null) missing.add('name');
      if (surname == null) missing.add('surname');
      if (birthday == null) missing.add('birthday');
      if (telegramUsername == null) missing.add('telegramUsername');
      if (description == null) missing.add('description');

      if (missing.isNotEmpty) {
        return Response(
          400,
          body: jsonEncode({'error': 'Missing fields: $missing'}),
          headers: {'Content-Type': 'application/json'},
        );
      }

      final result = await firebaseService.updateUser(
        id!,
        password!,
        name!,
        surname!,
        phone!,
        telegramUsername!,
        birthday!,
        description!,
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
