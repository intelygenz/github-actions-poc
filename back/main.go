package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type greetings struct {
	Name string `json:"name"`
}

func main() {
	p := os.Getenv("PORT")
	if p == "" {
		p = "3000"
	}

	err := setupServer().Run(fmt.Sprintf(":%s", p))
	if err != nil {
		panic(err)
	}
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
