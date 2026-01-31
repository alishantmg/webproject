<?php
    require_once __DIR__ . '/db.php';

    function lookValue($username) {  // a function to check whether a username exists
        $conn = db_conn();
        $sql = "SELECT Id FROM Users where Username = '$username' AND is_deleted = 0";  // select rows from Users where the Username column is equal to $username
        $result = mysqli_query($conn, $sql);
        return mysqli_num_rows($result) > 0;
    }

    function regUser($username, $password, $email) {
        $conn = db_conn();
        if (lookValue($username))
           return ['success' => false, 'message' => 'Username already exists'];
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $sql= "INSERT INTO Users (Username, Password, Email) VALUES('$username', '$hashed', '$email') ";
        $result = mysqli_query($conn, $sql);
        if ($result)
            $message = "User created successfully";
        else
            $message = "Error creating user: " . mysqli_error($conn);
        return ['success' => $result, 'message' => $message];
   
    }

    function verify($username, $password) {
        $conn = db_conn();
        $sql = "SELECT * FROM Users WHERE Username = '$username'AND is_deleted = 0";
        $result = mysqli_query($conn, $sql);
        if (!$result || mysqli_num_rows($result) == 0)
            return false;
        $row = mysqli_fetch_assoc($result);
        return password_verify($password, $row['Password']);

    }

    function get_user_byId($id) {
        $conn = db_conn();
        $sql = "SELECT Id, Username, Email, Name, PhoneNo. FROM Users WHERE Id = '$id' AND is_deleted = 0";
        $result = mysqli_query($conn, $sql);
        if ($result && mysqli_num_rows($result) > 0)
            return mysqli_fetch_assoc($result);
        return null;
    }

    function update_profile($id, $name, $email, $phone) {
        $conn = db_conn();
        $sql = "UPDATE Users SET Name = '$name', Email = '$email', `PhoneNo.` = '$phone' WHERE Id = '$id' AND is_deleted = 0";
        $result = mysqli_query($conn, $sql);
        return $result;
    }

    function user_del($id) {
        $conn = db_conn();
        $sql = "UPDATE Users SET is_deleted = 1 WHERE Id = '$id'";
        $result = mysqli_query($conn, $sql);
        return $result;
    }

    
?>