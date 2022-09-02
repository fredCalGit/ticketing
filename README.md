# ticketing

Ticket selling platform, backend on cloud microservices architecture with Node.js / Typescript, client on Next.JS

Required: Node v16 LTS

Cloud Platform: Google Cloud Plarform

Must add jwt secret to local machine
from project root directory:

$ kubectl create secret generic jwt-secret --from-literal=JWT_KEY=fdso4rrhotgh324523##\_\_

to start application, from project root directory:
$ skaffold dev
