# Back

This is a basic API REST writen in Golang and Gin framework.

Expose the endpoint `/greetings` using method `POST` and the payload expect a JSON with the field `name` like the next example.

```json
{
    "name": "Your Name"
}
```

and will return the string

```
Greetings Your Name
```

## Run tests

In order to run the back tests with the coverage report perform the command below.

```bash
go test ./... -cover -v -coverprofile=back-coverage.out
```
