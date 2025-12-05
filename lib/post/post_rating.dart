// import 'dart:convert';

// import 'package:buddy_up/firebase.dart';
// import 'package:shelf/shelf.dart';
// import 'package:buddy_up/server.dart';

// Future<void> sendRating(FirebaseService firebaseService) async {
//   app.post('/sendRating', (Request req) async {
//     try {
//       final to = req.url.queryParameters['to'];

//       if (to == null) {
//         return Response(
//           400,
//           body: jsonEncode({'error': 'Missing ids'}),
//           headers: {'Content-Type': 'application/json'},
//         );
//       }
//       final result = await firebaseService.sendRating(to);

//       return Response.ok(
//         jsonEncode(result),
//         headers: {'Content-Type': 'application/json'},
//       );
//     } catch (e) {
//       return Response.internalServerError(
//         body: jsonEncode({'error': e.toString()}),
//         headers: {'Content-Type': 'application/json'},
//       );
//     }
//   });
// }
