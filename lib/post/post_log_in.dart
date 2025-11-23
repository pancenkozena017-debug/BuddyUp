import 'dart:convert';

import 'package:buddy_up/firebase.dart';
import 'package:shelf/shelf.dart';
import 'package:buddy_up/server.dart';

Future<void> login(FirebaseService firebaseService) async{
  app.post('/login', (Request req) async {
    try {
      final payload = await req.readAsString();
      final data = jsonDecode(payload);

      final email = data['email'];
      final password = data['password'];

      final result = await firebaseService.loginUser(email, password);

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
