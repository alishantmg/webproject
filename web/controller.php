<?php
    session_start();

    require_once __DIR__ . '/userModel.php';
    require_once __DIR__ . '/itemModel.php';

    header('Content-Type: application/json');
    function send($arr) {
        echo json_encode($arr);
        exit;
    }
    
    if(isset($_POST['command'])) {
        $command = $_POST['command'];
    }
    else{
        $command = '';
    }

    function require_login() {
        if (!isset($_SESSION['user_id'])) {
            send(['success' => false, 'message' => 'You must be logged in to perform this action.']);
        }
    }

    if($command == 'SignUp') {
        $username = trim($_POST['Username']);
        $password = trim($_POST['Password']);
        $email = trim($_POST['Email']);

        if ($username == '' || $password == '' || $email == '') {
            send(['success' => false, 'message' => 'All fields are required.']);
        }

        $result = regUser($username, $password, $email);
        send ($result);
    }

    if($command == 'SignIn') {
        $username = trim($_POST['Username']);
        $password = trim($_POST['Password']);

        if ($username == '' || $password == '') {
            send(['success' => false, 'message' => 'All fields are required.']);
        }

        if(!verify($username, $password)) {
            send(['success' => false, 'message' => 'Invalid username or password.']);
        }

        $conn = db_conn();
        $sql ="SELECT * FROM Users WHERE Username = '$username' AND is_deleted = 0";
        $result = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($result);

        $_SESSION['user_id'] = $row['Id'];
        $_SESSION['username'] = $row['Username'];
        send(['success' => true, 'message' => 'Logged in successfully.']);
    }

    if($command == 'SignOut') {
        session_unset();
        session_destroy();
        send(['success' => true, 'message' => 'Logged out successfully.']);
    }

    if($command == 'CheckSession') {
        if (isset($_SESSION['user_id'])) {
            $profile = get_user_byId($_SESSION['user_id']);
            send(['success' =>true, 'loggedIn' => true, 'profile' => $profile]);
        }
        send(['success' => true, 'loggedIn' => false]);
    }

    if($command == 'GetProfile') {
        require_login();
        $profile = get_user_byId($_SESSION['user_id']);
        send(['success' => true, 'profile' => $profile]);
    }

    if ($command == 'UpdateProfile') {
        require_login();
        $email = trim($_POST['Email']);
        $name = trim($_POST['Name']);
        $phone = trim($_POST['Phone']);

        if ($email == '' || $name == '' || $phone == '') {
            send(['success' => false, 'message' => 'All fields are required.']);
        }

        $result = update_profile($_SESSION['user_id'], $email, $name, $phone);
        send(['success' => $result]);
    }

    if($command == 'DeleteAccount') {
        require_login();
        $result = user_del($_SESSION['user_id']);
        session_unset();
        session_destroy();
        send(['success' => $result]);
    }

    if ($command == 'PostItem') {
        require_login();
        $title = trim($_POST['title']);
        $desc = trim($_POST['description']);
        $type = trim($_POST['item_type']);
        $location = trim($_POST['location']);

        if ($title == '' || $desc == '' || $type == '' || $location == '') {
            send(['success' => false, 'message' => 'Missing fields']);
        }
        $result = createItem($_SESSION['user_id'], $title, $desc, $type, $location);
        send(['success' => $result]);
    }

    if($command == 'ListItems') {
        
        if(isset($_POST['Filter'])) {
            $filter = $_POST['Filter'];
        }
        else{
            $filter = 'all';
        }
        if($filter == "lost") {
            $items = item_list_lost();
        }
        else if($filter == "found") {
            $items = item_list_found();
        }
        else {
            $items = item_list_all();
        }
        send(['success' => true, 'items' => $items]);
    }

    if($command == 'MyPosts') {
        require_login();
        $items = item_list_by_user($_SESSION['user_id']);
        send(['success' => true, 'items' => $items]);
    }

    if($command == 'SearchItems') {
        $search = trim($_POST['search']);
        if ($search == '') {
            send(['success' => true, 'items' => []]);
        }
        $items = item_search($search);
        send(['success' => true, 'items' => $items]);
    }

    if($command == 'MarkReturned') {
        require_login();
        $item_id = trim($_POST['item_id']);
        if ($item_id == '') {
            send(['success' => false, 'message' => 'Missing item ID']);
        }
        $result = item_mark_returned($item_id, $_SESSION['user_id']);
        send(['success' => $result]);
    }

    send (['success' => false, 'message' => 'Invalid command.']);

?>