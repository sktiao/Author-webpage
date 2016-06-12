<?php
	if ($post->request == 'checkToken') {
		if ($token = checkToken()) {
			$username = getTokenClaims($token)->user;
			echo(json_encode(array("reply"=>"success")));
		} else {
			echo("invalid token");
		}
	}
	if ($post->request == 'getUserInfo') {
		if ($token = checkToken()) {
			if (property_exists($post,"data")) {
				$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
				
				$data = $mysqli->real_escape_string($post->data);
				$username = getTokenClaims($token)->user;
				
				if ($result = $mysqli->query("SELECT ".$data." FROM users WHERE username = '".$username."'")) {
					$row = $result->fetch_assoc();
					echo(json_encode(array("reply"=>"success","data"=>$row)));
				} else {
					echo("query SELECT failed");
				}
				
				$mysqli->close();
			} else {
				echo("no data");
			}
		} else {
			echo("invalid token");
		}
	}
	if ($post->request == 'logout') {
		if ($token = checkToken()) {
			if (isset($_COOKIE["token"])) {
				unset($_COOKIE["token"]);
				setcookie("token","", time()-3600);
			}
			echo(json_encode(array("reply"=>"success")));
		} else {
			echo("invalid token");
		}
	}
?>