// import 'package:buddy_up/keys.dart';
import 'package:dotenv/dotenv.dart';
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
    var env = DotEnv(includePlatformEnvironment: true)..load();

    final APIKEY = env['APIKEY']!;
    final PROJECTID = env['PROJECTID']!;
    final APPID = env['APPID']!;
    final MESSAGINGSenderID = env['MESSAGINGSenderID']!;
    final AUTHDOMAIN = env["AUTHDOMAIN"]!;
    var options = FirebaseOptions(
      appId: APPID,
      apiKey: APIKEY,
      projectId: PROJECTID,
      messagingSenderId: MESSAGINGSenderID,
      authDomain: AUTHDOMAIN,
    );
    print("Firebase options loaded: apiKey=$APIKEY, projectId=$PROJECTID");

    var app = await Firebase.initializeApp(options: options);

    final auth = FirebaseAuth.instanceFor(app: app);
    final database = FirebaseDatabase(
      app: app,
      databaseURL:
          "https://alco-tinder-default-rtdb.europe-west1.firebasedatabase.app/",
    );
    print("🔥 Firebase initialized successfully");

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
    String description
  ) async {
    print(
      "📥 registerUser called with email=$email, name=$name, surname=$surname, description=$description",
    );
    try {
      final userCredential = await auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      final user = userCredential.user!;
      print("✅ User created in Firebase Auth: uid=${user.uid}");

      var ref = database.reference();
      var usersRef = ref.child('users');
      var userRef = usersRef.child(user.uid);

      await userRef.set({
        'id': user.uid,
        'name': name,
        'description': description,
        'email': email,
        'surname': surname,
        'phone': phone,
        'telegramUsername': telegramUsername,
        'birthday': birthday,
        'photo': photo,
        'rating': 0,
      });

      print("💾 User data saved in Realtime Database: uid=${user.uid}");
      return {'statusCode': '200', 'status': 'ok', 'uid': user.uid};
    } catch (ex) {
      print("❌ registerUser error: $ex");
      return {'statusCode': '400', 'status': 'bad', 'error': ex.toString()};
    }
  }

  Future<Map<String, dynamic>> loginUser(String email, String password) async {
    print("📥 loginUser called with email=$email");
    try {
      final userCredential = await auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      final user = userCredential.user!;
      print("✅ User logged in successfully: uid=${user.uid}");
      return {'statusCode': '200', 'status': 'ok', 'uid': user.uid};
    } catch (ex) {
      print("❌ loginUser error: $ex");
      return {'statusCode': '400', 'status': 'bad', 'error': ex.toString()};
    }
  }

  Future<Map<String, dynamic>> getUser(String uid) async {
    try {
      final ref = database.reference().child('users').child(uid);
      final snapshot = await ref.get();

      if (snapshot == null) {
        throw ("There is no user");
      }

      final userData = Map<String, dynamic>.from(snapshot as Map);

      return userData;
    } catch (e) {
      return {'error': e.toString()};
    }
  }

  Future<List<Map<String, dynamic>>> getAllUsers() async {
    final ref = database.reference().child('users');
    final snapshot = await ref.get();
    if (snapshot == null) {
      throw Exception("There are no users");
    }

    final rawData = snapshot as Map<dynamic, dynamic>;

    final users = rawData.values.map((user) {
      return Map<String, dynamic>.from(user as Map);
    }).toList();

    return users;
  }

  Future<List<Map<String, dynamic>>> getUsers(List<String> ids) async {
    final ref = database.reference().child('users');
    final snapshot = await ref.get();

    if (snapshot == null) {
      throw Exception("There are no users");
    }

    final rawData = Map<dynamic, dynamic>.from(snapshot as Map);

    final users = rawData.entries
        .where((entry) => ids.contains(entry.key.toString()))
        .map((entry) {
          final userMap = Map<dynamic, dynamic>.from(entry.value as Map);
          userMap['uid'] = entry.key.toString();
          return Map<String, dynamic>.from(userMap);
        })
        .toList();

    return users;
  }

  Future<Map<String, dynamic>> sendLikeToUser(
    String fromUid,
    String toUid,
  ) async {
    try {
      final likeRef = database.reference().child('likes/$toUid/$fromUid');
      final now = DateTime.now().toString();

      await likeRef.set({'timestamp': now});

      final reverseRef = database.reference().child('likes/$fromUid/$toUid');
      final reverseSnapshot = await reverseRef.get();

      if (reverseSnapshot != null) {
        final matchRef1 = database.reference().child('matches/$fromUid/$toUid');
        final matchRef2 = database.reference().child('matches/$toUid/$fromUid');

        await matchRef1.set({'with': toUid, 'timestamp': now});
        await matchRef2.set({'with': fromUid, 'timestamp': now});

        await database.reference().child('likes/$fromUid/$toUid').remove();
        await database.reference().child('likes/$toUid/$fromUid').remove();

        return {'statusCode': '200', 'status': 'match_created'};
      }

      return {'statusCode': '200', 'status': 'liked'};
    } catch (e) {
      return {'statusCode': '400', 'status': 'bad', 'error': e.toString()};
    }
  }

  Future<List<Map<String, dynamic>>> getLikedFromUsers(String uid) async {
    final ref = database.reference().child('likes/$uid');
    final snapshot = await ref.get();

    if (snapshot == null) {
      return [];
    }
    print(snapshot);
    final rawData = Map<dynamic, dynamic>.from(snapshot as Map);
    print(rawData);
final result = rawData.entries.map((entry) {
    return {
      'from': entry.key.toString(),
      'timestamp': entry.value['timestamp']
    };
  }).toList();
    return result;
  }

  Future<List<Map<String, dynamic>>> getMatch(String uid) async {
    final ref = database.reference().child('matches/$uid');
    final snapshot = await ref.get();

    if (snapshot == null) {
      return [];
    }

    final rawData = Map<dynamic, dynamic>.from(snapshot as Map);

    final matches = rawData.entries.map((entry) {
      final fromUid = entry.key.toString();
      final data = entry.value as Map<dynamic, dynamic>;

      return {'with': fromUid, 'timestamp': data['timestamp'] ?? ''};
    }).toList();

    return matches;
  }

  Future<Map<String, dynamic>> updateUser(
    String id,
    String name,
    String surname,
    String phone,
    String telegramUsername,
    String birthday,
    String description
  ) async {
    try {
      var ref = database.reference();
      var usersRef = ref.child('users');
      var userRef = usersRef.child(id);

      await userRef.set({
        'name': name,
        'surname': surname,
        'description': description,
        'phone': phone,
        'telegramUsername': telegramUsername,
        'birthday': birthday,
      });

      return {'statusCode': '200', 'status': 'ok', 'uid': id};
    } catch (ex) {
      print("❌ registerUser error: $ex");
      return {'statusCode': '400', 'status': 'bad', 'error': ex.toString()};
    }
  }

  Future<Map<String, dynamic>> sendRating(String to, int rating) async {
    try {
      var ref = database.reference();
      var usersRef = ref.child('users');
      var userRef = usersRef.child(to);

      final snapshot = await userRef.get();
      if (snapshot == null) {
        throw Exception("User not found");
      }
      final userData = Map<String, dynamic>.from(snapshot as Map);
      double currentRating = userData['rating'] ?? 0;

      double newRating = currentRating + rating;
      userRef.update({'rating': newRating});

      return {'statusCode': '200', 'status': 'ok'};
    } catch (ex) {
      print("❌ registerUser error: $ex");
      return {'statusCode': '400', 'status': 'bad', 'error': ex.toString()};
    }
  }

  Future<Map<String, dynamic>> removeLikeFromUser(
    String fromUid,
    String toUid,
  ) async {
    try {
      final likeRef = database.reference().child('likes/$toUid/$fromUid');
      await likeRef.remove(); 

      final matchRef1 = database.reference().child('matches/$fromUid/$toUid');
      final matchRef2 = database.reference().child('matches/$toUid/$fromUid');

      final match1 = await matchRef1.get();
      final match2 = await matchRef2.get();

      if (match1 != null || match2 != null) {
        await matchRef1.remove();
        await matchRef2.remove();

        return {'statusCode': '200', 'status': 'match_removed'};
      }

      return {'statusCode': '200', 'status': 'like_removed'};
    } catch (e) {
      return {'statusCode': '400', 'error': e.toString()};
    }
  }
}
