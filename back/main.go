package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

type greetings struct {
	Name string `json:"name"`
}

func main() {
	setupServer().Run(":3000")
}

func setupServer() *gin.Engine {
	r := gin.Default()

	r.POST("/greetings", handlerGreetings)

	return r
}

func handlerGreetings(c *gin.Context) {
	var greetings greetings
	err := c.BindJSON(&greetings)
	if err != nil {
		fmt.Printf("error validatint JSON input: %s", err)
	}

	Message := fmt.Sprintf("Greetings %s", greetings.Name)
	c.String(http.StatusOK, Message)

}
