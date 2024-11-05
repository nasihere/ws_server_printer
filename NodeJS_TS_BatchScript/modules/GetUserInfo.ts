import BaseModule from './BaseModule';

class GetUserInfo extends BaseModule {
    createPayload(username: string): string {
        return `
            <GetInfo>
                <ItemName>${username}</ItemName>
                <ItemValue>web</ItemValue>
            </GetInfo>
        `;
    }
}

export default GetUserInfo;
