import 'dart:convert';
import 'dart:io';
import 'package:buddy_up/firebase.dart';
import 'package:buddy_up/get/get_likes.dart';
import 'package:buddy_up/get/get_matches.dart';
import 'package:buddy_up/get/get_user.dart';
import 'package:buddy_up/get/get_users.dart';
import 'package:buddy_up/post/post_like.dart';
import 'package:buddy_up/post/post_log_in.dart';
import 'package:buddy_up/post/post_register.dart';
import 'package:buddy_up/put/update_profile.dart';
import 'package:buddy_up/post/post_rating.dart';
import 'package:buddy_up/delete/like_delete.dart';
import 'package:buddy_up/server.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart';
Middleware corsMiddleware() {
  return (Handler handler) {
    return (Request req) async {
      if (req.method == 'OPTIONS') {
        return Response.ok('', headers: _corsHeaders);
      }

      final response = await handler(req);
      return response.change(headers: _corsHeaders);
    };
  };
}

const _corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',// Забрав OPTIONS
  'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
};

void main() async {
  final firebaseService = await FirebaseService.initialize();

  app.get('/hello', (Request req) {
    return Response.ok(
      jsonEncode({'message': 'Hello from Dart Shelf + Firebase!'}),
      headers: {'Content-Type': 'application/json'},
    );
  });

  await register(firebaseService);
  await login(firebaseService);
  await get_user(firebaseService);
  await get_users(firebaseService);
  await sendLike(firebaseService);
  await get_likes(firebaseService);
  await get_matches(firebaseService);
  await update(firebaseService);
  await sendRating(firebaseService);
  await removeLike(firebaseService);
  final handler = Pipeline().addMiddleware(corsMiddleware()).addHandler(app);
  final port = int.parse(Platform.environment['PORT'] ?? '8080');

  final server = await serve(handler, InternetAddress.anyIPv4, port);
  print('Server running on http://localhost:$port');
  print('✅ Server running on http://${server.address.host}:${server.port}');
}
