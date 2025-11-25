import 'package:buddy_up/keys.dart';
import 'package:firebase_dart/auth.dart';
import 'package:firebase_dart/core.dart';
import 'package:firebase_dart/database.dart';
import 'package:firebase_dart/implementation/pure_dart.dart';

class FirebaseService {
  final FirebaseApp firebaseApp;
  final FirebaseAuth auth;
  final FirebaseDatabase database;

  FirebaseService._(this.firebaseApp, this.auth, this.database);

  static Future<FirebaseService> initialize() async {
    FirebaseDart.setup();

    var options = FirebaseOptions(
      appId: APPID,
      apiKey: APIKEY,
      projectId: PROJECTID,
      messagingSenderId: MESSAGINGSenderID,
      authDomain: AUTHDOMAIN,
    );

    var app = await Firebase.initializeApp(options: options);

    final auth = FirebaseAuth.instanceFor(app: app);
    final database = FirebaseDatabase(
      app: app,
      databaseURL:
          "https://alco-tinder-default-rtdb.europe-west1.firebasedatabase.app/",
    );

    return FirebaseService._(app, auth, database);
  }

  Future<Map<String, dynamic>> registerUser(
    String email,
    String password,
    String name,
    String surname,
    String phone,
    String telegramUsername,
    String birthday,
    String photo,
  ) async {
    final userCredential = await auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    try {
      var ref = database.reference();
      var usersRef = ref.child('users');
      final user = userCredential.user!;
      var userRef = usersRef.child(user.uid);

      await userRef.set({
        'id': user.uid,
        'name': name,
        'email': email,
        'surname': surname,
        'phone': phone,
        'telegramUsername': telegramUsername,
        'birthday': birthday,
        'photo': photo,
        'rating': 0,
      });

      return {'statusCode': '200', 'status': 'ok', 'uid': user.uid};
    } catch (ex) {
      return {'statusCode': '400', 'status': 'bad', 'error': ex};
    }
  }

  Future<Map<String, dynamic>> loginUser(String email, String password) async {
    try {
      final userCredential = await auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = userCredential.user!;

      return {'statusCode': '200', 'status': 'ok', 'uid': user.uid};
    } catch (ex) {
      return {'statusCode': '400', 'status': 'bad', 'error': ex};
    }
  }

  Future<Map<String, dynamic>> getUser(String uid) async {
    try {
      final ref = database.reference().child('users').child(uid);
      final snapshot = await ref.once();

      if (snapshot.value == null) {
        throw ("There is no user");
      }

      final userData = Map<String, dynamic>.from(snapshot.value as Map);

      return userData;
    } catch (e) {
      return {'error': e.toString()};
    }
  }

}
