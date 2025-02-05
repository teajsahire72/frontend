import React, { Fragment, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker';
import { useMutation, useQuery } from '@apollo/client';
import { EDIT_USER, VIEW_USER } from '../Queries';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { fileToBase64, toDateStr } from '../Convert';

import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Edit() {
    let history = useNavigate();

    const [uid, setUId] = useState(0);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [joiningDate, setJoiningDate] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        setUId(parseInt(localStorage.getItem('id'))) // set the integer value
    }, []);

    const { data, loading, error } = useQuery(VIEW_USER, { variables: { id: uid } });

    useEffect(() => {
        if (data && data.getUser) {
            setName(data.getUser.name);
            setEmail(data.getUser.email);
            setJobTitle(data.getUser.job_title);
            setJoiningDate(toDateStr(new Date(data.getUser.joining_date)));

            // Handle if content is already a base64 string (image data)
            if (typeof data.getUser.content === "string" && data.getUser.content.startsWith("data:image")) {
                setContent(data.getUser.content);
            } else {
                console.warn("Skipping fileToBase64, content is not a Blob or valid base64 string");
            }
        }
    }, [data]);

    const [changeUser] = useMutation(EDIT_USER);

    if (loading) return <Fragment>Loading...</Fragment>;
    if (error) return <Fragment>Error: {error.message}</Fragment>;

    const changeContent = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate if it's a Blob (file)
            if (!(file instanceof Blob)) {
                console.error("Error: Expected a Blob but received:", file);
                return;
            }

            fileToBase64(file, function(base64Data) {
                console.log(base64Data);
                setContent(base64Data); // Update state with base64 image
            });
        }
    }

    const handelSubmit = async (e) => {
        e.preventDefault();  // Prevent reload
        let b = name, c = email, d = jobTitle, f = joiningDate, g = content; // sent to server
        try {
            await changeUser({ variables: { id: uid, name: b, email: c, job_title: d, joining_date: f, content: g } });
            history('/'); // redirect to home
        } catch (error) { 
            alert(error.message);
        }
    }

    return (
        <div>
            <Form className="d-grid gap-2" style={{ marginLeft: '25rem', marginRight: '25em' }}>
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Control value={name}
                        onChange={e => setName(e.target.value)}
                        type="text" placeholder="Enter Name" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Control value={email}
                        onChange={e => setEmail(e.target.value)}
                        type="email" placeholder="Enter Email" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicJobTitle">
                    <Form.Control value={jobTitle}
                        onChange={e => setJobTitle(e.target.value)}
                        type="text" placeholder="Enter Job Title" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicJoiningDate">
                    <div className="mb-3">
                        <label htmlFor="joiningDate">Joining Date :</label>
                        <DatePicker value={joiningDate}
                            onChange={e => setJoiningDate(toDateStr(e))} />
                    </div>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPhoto">
                    <Form.Control onChange={changeContent}
                        type="file" />
                </Form.Group>
                <div>
                    <Link to='/'>
                        <Button variant="primary" size="lg">
                            Home
                        </Button>
                    </Link>
                    <Button
                        onClick={handelSubmit}
                        variant="warning" type="submit" size="lg">
                        Update
                    </Button>
                    {content && <img src={content} width={75} height={75} alt="User Content" />}
                </div>
            </Form>
        </div>
    );
}

export default Edit;
