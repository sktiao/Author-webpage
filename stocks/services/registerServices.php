<?php
	if ($post->request == 'register') {
		if (property_exists($post, "data")) {
			if (property_exists($post->data, "username") && property_exists($post->data, "password") && strlen($post->data->username)>0 && strlen($post->data->password)>0) {
				$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
				
				$username = $mysqli->real_escape_string($post->data->username);
				$password = $mysqli->real_escape_string($post->data->password);
				
				if ($result = $mysqli->query("SELECT id FROM users WHERE username = '".$username."'")) {
					if (count($result->fetch_assoc()) === 0) {
						$salt = base64_encode(mcrypt_create_iv(22));
						$passwordhash = password_hash($password, PASSWORD_BCRYPT, ['salt'=>$salt]);
						$portfolio = "{\"cash\":10000,\"stocks\":[]}";
						
						if ($mysqli->query("INSERT INTO users (username,salt,passwordhash,portfolio) VALUES ('".$username."','".$salt."','".$passwordhash."','".$portfolio."')")) {
							echo(json_encode(array("reply"=>"success")));
						} else {
							echo("query INSERT failed");
						}
					} else {
						echo("username taken");
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
