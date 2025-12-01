import 'dart:convert';
import 'package:buddy_up/firebase.dart';
import 'package:shelf/shelf.dart';
import 'package:buddy_up/server.dart';

Future<void> login(FirebaseService firebaseService) async {
  app.post('/login', (Request req) async {
    try {
      final email = req.url.queryParameters['email'];
      final password = req.url.queryParameters['password'];

      // 🔍 Логи вхідних даних
      print("========== LOGIN REQUEST RECEIVED ==========");
      print("Raw URL: ${req.requestedUri}");
      print("email from query = $email");
      print("password from query = $password");

      if (email == null || password == null) {
        print("❌ Missing fields detected!");
        return Response(
          400,
          body: jsonEncode({'error': 'Missing email or password'}),
          headers: {'Content-Type': 'application/json'},
        );
      }

      print("🔐 Attempting Firebase login...");
      final result = await firebaseService.loginUser(email, password);
      print("🔥 Firebase login result = $result");

      print("✅ LOGIN SUCCESS, RESPONDING 200");
      return Response.ok(
        jsonEncode(result),
        headers: {'Content-Type': 'application/json'},
      );
    } catch (e, stack) {
      // 🚨 Логи помилки
      print("====== 🔥 ERROR INSIDE /login ENDPOINT ======");
      print(e);
      print("------ Stack Trace ------");
      print(stack);
      print("============================================");

      return Response.internalServerError(
        body: jsonEncode({'error': e.toString()}),
        headers: {'Content-Type': 'application/json'},
      );
    }
  });
}
