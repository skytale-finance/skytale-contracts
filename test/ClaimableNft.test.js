const assert = require('assert');
const {
  timeTravel,
  currentBlockTime,
  getTimestamp,
} = require('./helper/timeHelper');
const w3 = require('web3');
const { toWei, fromWei } = w3.utils;

const ClaimableNft = artifacts.require('./ClaimableNft');
const secondsInDay = 86400;
const secondsIn30Days = secondsInDay * 30;

contract('ClaimableNft', ([owner, user1, user2, user3, user4]) => {
  describe('Owner & beneficiaries', async function () {
    beforeEach('Deploy Token and MultiVesting contracts', async () => {
      const args = [1, 'SILVER BADGE', 'SILVER'];
      claimNftInstance = await ClaimableNft.new(...args, { from: owner });
    });

    describe('deployment', async () => {
      it('deploys successfully', async () => {
        const address = await claimNftInstance.address;
        assert(address !== 0x0);
        assert(address !== '');
        assert(address !== null);
        assert(address !== undefined);
      });
    });

    it('has name', async () => {
      const name = await claimNftInstance.name();
      assert(name === 'SILVER BADGE');
    });

    it('has symbol', async () => {
      const symbol = await claimNftInstance.symbol();
      assert(symbol === 'SILVER');
    });
  });

  describe('add Users to mint nfts', async () => {
    it('Should return false ', async function () {
      const x = await claimNftInstance.usersMap(user1);
      assert(x === false);
    });

    it('Allows to add single user to mint ', async function () {
      const args = [user1];
      await claimNftInstance.addUserToMint(...args, { from: owner });
      const x = await claimNftInstance.usersMap(user1);
      assert(x === true);
    });

    it('Will not allow user add user multiple times', async () => {
      const args = [user2];
      await claimNftInstance.addUserToMint(...args, { from: owner });
      await assert.rejects(
        async () => {
          await claimNftInstance.addUserToMint(...args, { from: owner });
        },
        { reason: 'User already Added' }
      );
    });

    it('Allow batch of users to get added', async () => {
      const args = [user1, user2, user3, user4];
      await claimNftInstance.addBulkUser(args, { from: owner });
      const x = await claimNftInstance.usersMap(user1);
      const y = await claimNftInstance.usersMap(user2);
      const z = await claimNftInstance.usersMap(user3);
      const y1 = await claimNftInstance.usersMap(user4);
      assert(x === true);
      assert(y === true);
      assert(z === true);
      assert(y1 === true);
    });

    it('only owner of contract can add users', async () => {
      const args = [user1, user2, user3, user4];
      await assert.rejects(
        async () => {
          await claimNftInstance.addBulkUser(args, { from: user3 });
        },
        { reason: 'Ownable: caller is not the owner' }
      );

      const userArgs = [user1];
      await assert.rejects(
        async () => {
          await claimNftInstance.addUserToMint(...userArgs, { from: user3 });
        },
        { reason: 'Ownable: caller is not the owner' }
      );
    });
  });

  describe('Mint Functionality', async () => {
    it('should not allow to mint nft if not approved by admin ', async () => {
      it('Should return false ', async function () {
        const args = ['12333444'];

        await assert.rejects(
          async () => {
            await claimNftInstance.mintNFT(...args, { from: user2 });
          },
          { reason: 'Not allowed to mint' }
        );
      });
    });

    it('should allow user to mint nft once added by owner', async () => {
      const args = [user1, user2, user3, user4];
      await claimNftInstance.addBulkUser(args, { from: owner });

      const tokenUri = ['12333333'];
      const mintNftByUser1 = await claimNftInstance.mintNFT(...tokenUri, {
        from: user1,
      });
      const getBalance = await claimNftInstance.balanceOf(user1);
      const getTokenUri = await claimNftInstance.getTokenUri(user1);

      assert(+getBalance === 1);
      assert(+getTokenUri === 1);
      assert(mintNftByUser1.tx !== 0x0);
      assert(mintNftByUser1.tx !== '');
      assert(mintNftByUser1.tx !== null);
      assert(mintNftByUser1.tx !== undefined);
    });

    it('should not allow user to mint multiple nfts', async () => {
      const args = [user1, user2, user3, user4];
      await claimNftInstance.addBulkUser(args, { from: owner });

      const tokenUri = ['12333333'];
      await claimNftInstance.mintNFT(...tokenUri, { from: user1 });

      await assert.rejects(
        async () => {
          await claimNftInstance.mintNFT(...tokenUri, { from: user1 });
        },
        { reason: 'Not allowed to mint' }
      );
    });

    describe('Burn Nft', async () => {
      it('should allow user burn their nft', async () => {
        const args = [user1, user2, user3, user4];
        await claimNftInstance.addBulkUser(args, { from: owner });

        const tokenUri = ['12333333'];
        await claimNftInstance.mintNFT(...tokenUri, { from: user4 });
        const getTokenUri = await claimNftInstance.getTokenUri(user4);

        const burnNft = await claimNftInstance.burnNFT(
          +getTokenUri.toString(16),
          { from: user4 }
        );
        assert(burnNft.tx !== 0x0);
        assert(burnNft.tx !== '');
        assert(burnNft.tx !== null);
        assert(burnNft.tx !== undefined);

        const getBalance = await claimNftInstance.balanceOf(user4);
        assert(+getBalance.toString(16) === 0);
      });
    });
  });
});
