import { authorize } from "./dist/modules/oidc/oidc.services.js";

async function test() {
    try {
        console.log("TEST 1: openid profile email");
        await authorize({ client_id: 'test', redirect_uri: 'test', response_type: 'code', scope: 'openid profile email', userId: 'test' }).catch(e => console.log(e.message));
        
        console.log("TEST 2: openid profile email location");
        await authorize({ client_id: 'test', redirect_uri: 'test', response_type: 'code', scope: 'openid profile email location', userId: 'test' }).catch(e => console.log(e.message));

        console.log("TEST 3: openid interests");
        await authorize({ client_id: 'test', redirect_uri: 'test', response_type: 'code', scope: 'openid interests', userId: 'test' }).catch(e => console.log(e.message));

        console.log("TEST 4: openid unknown_scope");
        await authorize({ client_id: 'test', redirect_uri: 'test', response_type: 'code', scope: 'openid unknown_scope', userId: 'test' }).catch(e => console.log(e.message));
    } catch(err) {
        console.log("FATAL ERROR", err);
    }
}
test();
