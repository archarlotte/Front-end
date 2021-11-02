import React, {useEffect, useState} from "react";
import { Button, Alert, Form, Container, Row, Col, Table, Spinner } from "react-bootstrap";
import memoryUtils from "../utils/memory";

export default function Mail() {

	const [array, setArray] = useState([]);
	const [toRole, setToRole] = useState("1");

	const getMail = () => {
		console.log(memoryUtils.token, memoryUtils.role)
		if (memoryUtils.role === "1"){
			setToRole("2");
		}
		const message = fetch(`http://localhost:5014/communication/mail`, {
			method:'GET',
			headers: {
				"email":memoryUtils.token,
				"role":memoryUtils.role
			}
		}).then(res => res.json())
			.then(data => {
				console.log(data.data)
				setArray(data.data)
			})
	}

	useEffect(() => getMail(), [])

	const handleSend = (e) => {
		const feedback = e.target.value;
		const acceptName = e.target.parentElement.parentElement.childNodes[1].innerText;
		console.log(memoryUtils.token)
		console.log(acceptName)
		console.log(feedback)
		console.log(toRole)
		const sendFeedback = fetch("http://localhost:5014/communication/response", {
			method:'PUT',
			headers: {
				"Authorization": memoryUtils.token,
				'Content-type': 'application/json'
			},
			body: JSON.stringify({
				"feedback": feedback,
				"email": acceptName,
				"role": toRole
			})
		}).then(res => res.json())
			.then(data => {
				console.log(data);
				alert('send successful')
				window.location.reload();
			})
	}

	const connection = (number, direction) => {
		if (memoryUtils.role === "2"){
			if (direction === 4){
				if (number === 3){
					return "This charity rejected your connection!";
				}else {
					return 'This charity accepted your connection!'
				}
			}else if (direction === 3){
				if (number === 3){
					return "Rejected connection request!"
				}else {
					return 'Accepted connection request!'
				}
			}else if (direction === 2){
				if (number === 1){
					return (
						<>
							<Button variant="outline-primary" onClick={handleSend} value={2}>Accept!</Button>
							<Button className="ml-3" variant="outline-danger" onClick={handleSend} value={3}>Reject</Button>
						</>
					)
				}else if (number === 2){
					return "Accepted connection request!";
				}else {
					return "Rejected connection request!";
				}
			}
		}else{
			if (direction === 3){
				if (number === 3){
					return "This sponsor rejected your connection!";
				}else {
					return 'This sponsor accepted your connection!'
				}
			}else if (direction === 4){
				if (number === 3){
					return "Rejected connection request!"
				}else {
					return 'Accepted connection request!'
				}
			}else if (direction === 1){
				if (number === 1){
					return (
						<>
							<Button variant="outline-primary" onClick={handleSend} value={2}>Accept!</Button>
							<Button className="ml-3" variant="outline-danger" onClick={handleSend} value={3}>Reject</Button>
						</>
					)
				}else if (number === 2){
					return "Accepted connection request!";
				}else {
					return "Rejected connection request!";
				}
			}
		}
	}
		// if (number === 1){
		// 	return (
		// 		<>
		// 		<Button variant="outline-primary" onClick={handleSend} value={2}>Accept!</Button>
		// 		<Button className="ml-3" variant="outline-danger" onClick={handleSend} value={3}>Reject</Button>
		// 		</>
		// )
		// }else if (number === 2){
		// 	return "Accepted connection request!";
		// }else {
		// 	return "Rejected";
		// }


	const showTable = () => {
		if (array.length === 0){
			return (<>
          <Container style={{ width: "80%", margin: "30px auto" }}>
            <Alert variant="secondary">
              There is no message.
            </Alert>
          </Container>
        </>)
		}else {
			return (
				<Table striped bordered hover>
					<thead>
					<tr>
						<th>#</th>
						<th>Email</th>
						<th>Message Content</th>
						<th>Status</th>
					</tr>
					</thead>
					<tbody>
					{array.map((i, index) => (
						<tr key={index}>
							<td>{index + 1}</td>
							<td>{i.email}</td>
							<td>{i.content}</td>
							<td>
								{connection(i.is_connect,i.direction)}
							</td>
						</tr>
					))}
					</tbody>
				</Table>
			)
		}
	}
	return(
		<>
			{showTable()}
		</>
	)
}