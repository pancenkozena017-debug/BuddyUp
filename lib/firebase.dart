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
      final snapshot = await ref.get();

      if (snapshot == null) {
        throw ("There is no user");
      }

      final userData = Map<String, dynamic>.from(snapshot.value as Map);

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
    // це не працює
    final ref = database.reference().child('likes/$uid');
    final snapshot = await ref.get();

    if (snapshot == null) {
      return [];
    }
    print(snapshot);
    final rawData = Map<dynamic, dynamic>.from(snapshot as Map);
    print(rawData);
    final likeObj = Map<String, dynamic>.from(snapshot);

    print(likeObj);
    print(
      likeObj,
    ); //виводить це {from: gKgkipxPSjXeoWtJFzwFllpWnbJ3, timestamp: 2025-11-27T20:59:32.979723, to: Yy0Nfa87qlWNmxdTiMpfClJ6iOT2}
    return [likeObj];
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
}
