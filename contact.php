<?php
/**
 * Sanchez Masonry — estimate form handler.
 * Receives the form POST from the site, validates it, and emails the lead.
 */

header('Content-Type: application/json; charset=utf-8');

function respond($ok, $message) {
    http_response_code($ok ? 200 : 400);
    echo json_encode(['success' => $ok, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.');
}

// Honeypot — bots fill every field, humans never see this one.
if (!empty($_POST['bot-field'])) {
    // Pretend success so the bot doesn't retry, but send nothing.
    respond(true, 'Thank you!');
}

$name     = trim($_POST['name'] ?? '');
$phone    = trim($_POST['phone'] ?? '');
$email    = trim($_POST['email'] ?? '');
$service  = trim($_POST['service'] ?? '');
$location = trim($_POST['location'] ?? '');
$message  = trim($_POST['message'] ?? '');

if ($name === '' || $phone === '' || $email === '' || $service === '' || $location === '' || $message === '') {
    respond(false, 'Please fill in all fields.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.');
}

// Strip anything that could be used for header injection.
function clean_header_value($value) {
    return str_replace(["\r", "\n", "%0a", "%0d"], '', $value);
}

$name     = clean_header_value($name);
$phone    = clean_header_value($phone);
$email    = clean_header_value($email);
$service  = clean_header_value($service);
$location = clean_header_value($location);

$to = 'chemitovajise123@gmail.com';
$subject = mb_encode_mimeheader('New estimate request - ' . $service, 'UTF-8');

$body = "New free estimate request from masonrysanchez.com\n\n"
      . "Name: {$name}\n"
      . "Phone: {$phone}\n"
      . "Email: {$email}\n"
      . "Service: {$service}\n"
      . "Location: {$location}\n\n"
      . "Project details:\n{$message}\n";

$fromDomain = 'masonrysanchez.com';
$replyToName = mb_encode_mimeheader($name, 'UTF-8');
$headers = "From: Sanchez Masonry Website <noreply@{$fromDomain}>\r\n"
         . "Reply-To: {$replyToName} <{$email}>\r\n"
         . "Content-Type: text/plain; charset=utf-8\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    respond(true, 'Thank you! We will reach out shortly.');
}

respond(false, 'We could not send your request. Please call us directly at (210) 328-7738.');
