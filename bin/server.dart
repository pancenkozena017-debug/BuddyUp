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
import 'package:buddy_up/server.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart';

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
  final handler = Pipeline().addMiddleware(logRequests()).addHandler(app);
  // Railway надає порт через змінну середовища
  final port = int.parse(Platform.environment['PORT'] ?? '8080');

  final server = await serve(handler, InternetAddress.anyIPv4, port);
  print('Server running on http://localhost:$port');
  print('✅ Server running on http://${server.address.host}:${server.port}');
}
