# Back

This is a basic API REST writen in Golang and Gin framework.

Just is exposed the endpoint `/greetings` allowing `POST`calls with a JSON with the field `name`
like the next example.

```json
{
    "name": "Your Name"
}
```

and will return the string

```
Greetings Your Name
```
