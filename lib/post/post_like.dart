import 'dart:convert';

import 'package:buddy_up/firebase.dart';
import 'package:shelf/shelf.dart';
import 'package:buddy_up/server.dart';

Future<void> sendLike(FirebaseService firebaseService) async{
  app.post('/sendLike', (Request req) async {
    try {
      final payload = await req.readAsString();
      final data = jsonDecode(payload);

      final to = data['to'];
      final from = data['from'];

      final result = await firebaseService.sendLikeToUser(to, from);

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
