import 'dart:convert';

import 'package:buddy_up/firebase.dart';
import 'package:shelf/shelf.dart';
import 'package:buddy_up/server.dart';

Future<void> get_user(FirebaseService firebaseService) async {
  app.get('/get_user', (Request req) async {
    try {
      final payload = await req.readAsString();
      final data = jsonDecode(payload);

      final uid = data['uid'];

      final result = await firebaseService.getUser(uid);

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
