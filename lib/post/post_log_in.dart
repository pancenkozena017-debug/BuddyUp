import 'dart:convert';

import 'package:buddy_up/firebase.dart';
import 'package:shelf/shelf.dart';
import 'package:buddy_up/server.dart';

Future<void> login(FirebaseService firebaseService) async {
  app.post('/login', (Request req) async {
    try {
      final email = req.url.queryParameters['email'];
      final password = req.url.queryParameters['password'];

      if (email == null && password == null) {
        return Response(
          400,
          body: jsonEncode({'error': 'Missing email or password'}),
          headers: {'Content-Type': 'application/json'},
        );
      }
      final result = await firebaseService.loginUser(email!, password!);

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
