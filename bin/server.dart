import 'dart:convert';
import 'package:buddy_up/firebase.dart';
import 'package:buddy_up/get/get_user.dart';
import 'package:buddy_up/get/get_users.dart';
import 'package:buddy_up/post/post_log_in.dart';
import 'package:buddy_up/post/post_register.dart';
import 'package:buddy_up/server.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;


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

  final handler = const Pipeline().addMiddleware(logRequests()).addHandler(app);

  final server = await io.serve(handler, 'localhost', 8080);
  print('✅ Server running on http://${server.address.host}:${server.port}');
}
