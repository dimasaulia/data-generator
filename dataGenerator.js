import inquirer from "inquirer";
import figlet from "figlet";
import chalk from "chalk";
import { createSpinner } from "nanospinner";
import fs from "fs";
import { faker } from "@faker-js/faker";

let payload = [];
let dataSize;
let fixSize;
let dataName;
let dataType;
let isDuplicteDataAllow;

async function dataSizeSetter() {
    const answer = await inquirer.prompt({
        name: "data_size",
        type: "input",
        message: chalk.green("How mach data you want generate: "),
    });
    dataSize = answer.data_size;
    fixSize = dataSize;
    if (Number.isNaN(Number(dataSize))) {
        console.log(
            chalk.bold.red("Operation failed, please enter correct number")
        );
        dataSize = 0;
        return;
    }
}

async function dataTypeSetter() {
    const answer = await inquirer.prompt({
        name: "data_type",
        type: "list",
        message: chalk.green("What kind of data do you want to create:"),
        choices: ["Room Name", "User and Card"],
    });
    dataType = answer.data_type;
}

async function fileNameSetter() {
    const answer = await inquirer.prompt({
        name: "data_name",
        type: "input",
        message: chalk.green("The name for the file you created: "),
    });
    dataName = answer.data_name + ".json";

    fs.access(`./${dataName}`, fs.F_OK, (err) => {
        if (!err) {
            console.error(err);
            dataName =
                answer.data_name +
                String(new Date(Date.now()))
                    .replaceAll(" ", "")
                    .slice(0, 20)
                    .replaceAll(":", "") +
                ".json";
            console.log(
                chalk.bold.yellow(
                    `File name already exist, file rename to "${dataName}"`
                )
            );
            return;
        }
    });
}

async function duplicateDataSetter() {
    const answer = await inquirer.prompt({
        name: "is_allow",
        type: "confirm",
        message: "Is duplicate data allowed",
    });
    isDuplicteDataAllow = answer.is_allow;
}

console.log(
    chalk.grey(
        figlet.textSync("Smart Door \n Test Tool", {
            font: "ogre",
            horizontalLayout: "default",
            verticalLayout: "default",
            width: 80,
            whitespaceBreak: true,
        })
    )
);

await dataSizeSetter();
await dataTypeSetter();
await duplicateDataSetter();
await fileNameSetter();
const spinner = createSpinner();
switch (dataType) {
    case "Room Name":
        while (dataSize > 0) {
            const data = { name: faker.lorem.words(3) };
            if (payload.length > 0 && !isDuplicteDataAllow) {
                const duplicatedata = payload.find((storeData) => {
                    if (storeData.name === data.name) return true;
                });
                if (duplicatedata) {
                    dataSize++;
                } else {
                    payload.push(data);
                }
            } else {
                payload.push(data);
            }

            spinner.start({
                text: chalk.greenBright(
                    `Generating data, please wait. Remain Queue ${dataSize}/${fixSize}`
                ),
            });
            dataSize--;
        }
        break;

    case "User and Card":
        while (dataSize > 0) {
            const data = {
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: faker.internet.password(8) + "@1Az",
                cardNumber: faker.datatype.hexadecimal({
                    length: 12,
                    prefix: "",
                }),
                pin: String(
                    faker.datatype.number({ min: 100000, max: 999999 })
                ),
            };
            if (payload.length > 0 && !isDuplicteDataAllow) {
                const duplicatedata = payload.find((storeData) => {
                    if (
                        storeData.cardNumber === data.cardNumber ||
                        storeData.email === data ||
                        storeData.username === data.username
                    )
                        return true;
                });

                if (duplicatedata) {
                    dataSize++;
                } else {
                    payload.push(data);
                }
            } else {
                payload.push(data);
            }

            spinner.start({
                text: chalk.greenBright(
                    `Generating data, please wait. Remain Queue ${dataSize}/${fixSize}`
                ),
            });
            dataSize--;
        }
        break;

    default:
        break;
}

fs.writeFile(dataName, `${JSON.stringify(payload)}`, function (err) {
    if (err) return 1;
    console.log("File is created successfully.");
});
spinner.success({
    text: chalk.greenBright(
        "Success genereting data, file succesfully save with name " + dataName
    ),
    color: "green",
});
