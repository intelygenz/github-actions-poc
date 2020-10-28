// godog
package main_test

import (
	"flag"
	"fmt"
	"github.com/cucumber/godog"
	"github.com/cucumber/godog/colors"
	"github.com/tebeka/selenium"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"testing"
	"time"
)

var Driver selenium.WebDriver

var opts = godog.Options{
	Output: colors.Colored(os.Stdout),
	Format: "progress", // can define default values
}

func init() {
	// godog v0.10.0 and earlier
	godog.BindFlags("godog.", flag.CommandLine, &opts)
}

func TestMain(m *testing.M) {
	flag.Parse()
	opts.Paths = flag.Args()

	// Start Docker
	cmd := exec.Command("docker", "run", "-d", "--network", "host", "selenium/standalone-chrome")
	container, err := cmd.CombinedOutput()
	if (err != nil) {
		fmt.Println(err)
		return
	}

	time.Sleep(5 * time.Second)

	status := godog.TestSuite{
		Name:                 "godogs",
		ScenarioInitializer:  InitializeScenario,
		Options:              &opts,
	}.Run()

	// Optional: Run `testing` package's logic besides godog.
	if st := m.Run(); st > status {
		status = st
	}

	cmd = exec.Command("docker", "rm", string(container), "-f")
	_, err = cmd.CombinedOutput()
	if (err != nil) {
		fmt.Println(err)
		return
	}
	os.Exit(status)
}

func InitializeScenario(s *godog.ScenarioContext) {
	s.BeforeScenario(func(scenario *godog.Scenario) {
		const (
			// These paths will be different on your system.
			path = "localhost"
			port = 4444
		)

		selenium.SetDebug(true)
		// Connect to the WebDriver instance running locally.
		caps := selenium.Capabilities{"browserName": "chrome"}
		driver, err := selenium.NewRemote(caps, fmt.Sprintf("http://localhost:%d/wd/hub", port))
		if err != nil {
			panic(err)
		}

		Driver = driver
		// Navigate to the simple playground interface.
		if err := Driver.Get("http://localhost:3000"); err != nil {
			panic(err)
		}

	})

	s.AfterScenario(func(sc *godog.Scenario, err error) {
		defer Driver.Quit()
	})
	s.Step(`^I write my name (.*) in the text box$`, iWriteMyNameInTheTextBox)
	s.Step(`^I click in a button with the text (.*)$`, iClickInAButtonWithTheText)
	s.Step(`^I should see the message (.*)$`, iShouldSeeTheMessageGreetings)
}

func iWriteMyNameInTheTextBox(name string) error {

	elem, err := Driver.FindElement(selenium.ByTagName, "input")
	if err != nil {
		panic(err)
	}
	if err := elem.Clear(); err != nil {
		panic(err)
	}

	err = elem.SendKeys(name)
	if err != nil {
		panic(err)
	}
	return nil
}

func iClickInAButtonWithTheText(buttonText string) error {

	btn, err := Driver.FindElement(selenium.ByTagName, "button")
	if err != nil {
		panic(err)
	}
	if err := btn.Click(); err != nil {
		panic(err)
	}

	return nil
}

func iShouldSeeTheMessageGreetings(message string) error {
	// Wait for the program to finish running and get the output.
	h3Divs, err := Driver.FindElements(selenium.ByTagName, "h3")
	if err != nil {
		panic(err)
	}
	text, err := h3Divs[1].Text()

	if err != nil {
		panic(err)
	}

	if text != message {
		log.Fatal("Text not match")
	}
	bytesImage, err := Driver.Screenshot()
	if err != nil {
		panic(err)
	}

	err = ioutil.WriteFile("./image.jpg", bytesImage, 0644)
	if err != nil {
		panic(err)
	}

	return nil
}
