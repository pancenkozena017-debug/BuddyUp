import 'dart:convert';

import 'package:buddy_up/firebase.dart';
import 'package:shelf/shelf.dart';
import 'package:buddy_up/server.dart';

Future<void> register(FirebaseService firebaseService) async {
  app.post('/register', (Request req) async {
    try {
      final payload = await req.readAsString();
      final data = jsonDecode(payload);

      final email = data['email'];
      final password = data['password'];
      final name = data['name'];
      final surname = data['surname'];
      final phone = data['phone'];
      final birthday = data['birthday'];
      final telegramUsername = data['telegramUsername'];
      final photo = data['photo'];

      final result = await firebaseService.registerUser(email, password, name, surname, phone, telegramUsername, birthday, photo);

      return Response.ok(
        jsonEncode(result),
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
