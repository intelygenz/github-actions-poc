package main

import (
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
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
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowHeaders:     []string{"*"},
	}))
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
