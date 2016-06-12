<?php
	if ($post->request == 'login') {
		if (property_exists($post, "data")) {
			if (property_exists($post->data, "username") && property_exists($post->data, "password") && strlen($post->data->username)>0 && strlen($post->data->password)>0) {
				$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
				
				$username = $mysqli->real_escape_string($post->data->username);
				$password = $mysqli->real_escape_string($post->data->password);
				
				if ($result = $mysqli->query("SELECT salt,passwordhash FROM users WHERE username = '".$username."'")) {
					$row = $result->fetch_assoc();
					if (count($row) > 0) {
						$salt = $row["salt"];
						$passwordhash = $row["passwordhash"];
						if ($passwordhash === password_hash($password, PASSWORD_BCRYPT, ['salt'=>$salt])) {
							$token = generateToken($username);
							setcookie("token",$token,time()+TOKEN_LIFESPAN);
							echo(json_encode(array("reply"=>"success")));
						} else {
							echo("incorrect password");
						}
					} else {
						echo("no such username");
					}
				} else {
					echo("query SELECT failed");
				}
				
				$mysqli->close();
			} else {
				echo("no username or password");
			}
		} else {
			echo("no data");
		}
	}

?>
