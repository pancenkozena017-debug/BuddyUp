import 'dart:convert';

import 'package:buddy_up/firebase.dart';
import 'package:buddy_up/server.dart';
import 'package:shelf/shelf.dart';

Future<void> removeLike(FirebaseService firebaseService) async {
  app.post('/removeLike', (Request req) async {
    try {
      final to = req.url.queryParameters['to'];
      final from = req.url.queryParameters['from'];

      if (to == null || from == null) {
        return Response(
          400,
          body: jsonEncode({'error': 'Missing ids'}),
          headers: {'Content-Type': 'application/json'},
        );
      }

      final result = await firebaseService.removeLikeFromUser(from, to);

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
