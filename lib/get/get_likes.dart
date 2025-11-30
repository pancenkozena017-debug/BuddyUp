import 'dart:convert';

import 'package:buddy_up/firebase.dart';
import 'package:shelf/shelf.dart';
import 'package:buddy_up/server.dart';

Future<void> get_likes(FirebaseService firebaseService) async {
  app.get('/get_likes', (Request req) async {
    try {
      final payload = await req.readAsString();
      final data = jsonDecode(payload);

      final uid = data['uid'];
      final likes = await firebaseService.getLikedFromUsers(uid);
      final ids = likes.map((e) => e['from'].toString()).toList();
      final result = await firebaseService.getUsers(ids);

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
