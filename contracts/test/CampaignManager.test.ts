import { expect } from "chai";
import { ethers } from "hardhat";
import { CampaignManager } from "../typechain-types";

describe("CampaignManager", function () {
  let campaignManager: CampaignManager;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    const CampaignManager = await ethers.getContractFactory("CampaignManager");
    campaignManager = await CampaignManager.deploy();
    await campaignManager.waitForDeployment();
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign with correct parameters", async function () {
      const name = "Test Campaign";
      const description = "A test campaign for digital art";
      const startTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const endTime = startTime + 86400; // 24 hours later
      const creationFee = await campaignManager.getCreationFee();

      await expect(
        campaignManager.connect(user).createCampaign(
          name,
          description,
          startTime,
          endTime,
          { value: creationFee }
        )
      ).to.emit(campaignManager, "CampaignCreated")
        .withArgs(0, user.address, name, description, startTime, endTime);

      const campaign = await campaignManager.getCampaign(0);
      expect(campaign[0]).to.equal(name);
      expect(campaign[1]).to.equal(description);
      expect(campaign[2]).to.equal(startTime);
      expect(campaign[3]).to.equal(endTime);
      expect(campaign[4]).to.equal(user.address);
      expect(campaign[5]).to.equal(false); // not ended
    });

    it("Should fail to create campaign with insufficient fee", async function () {
      const name = "Test Campaign";
      const description = "A test campaign";
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime + 86400;

      await expect(
        campaignManager.connect(user).createCampaign(
          name,
          description,
          startTime,
          endTime,
          { value: 0 }
        )
      ).to.be.revertedWith("Insufficient creation fee");
    });

    it("Should fail to create campaign with invalid time range", async function () {
      const name = "Test Campaign";
      const description = "A test campaign";
      const startTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const endTime = startTime + 86400;
      const creationFee = await campaignManager.getCreationFee();

      await expect(
        campaignManager.connect(user).createCampaign(
          name,
          description,
          startTime,
          endTime,
          { value: creationFee }
        )
      ).to.be.revertedWith("Start time must be in future");
    });
  });

  describe("Campaign Management", function () {
    beforeEach(async function () {
      const name = "Test Campaign";
      const description = "A test campaign";
      const startTime = Math.floor(Date.now() / 1000) + 3600;
      const endTime = startTime + 86400;
      const creationFee = await campaignManager.getCreationFee();

      await campaignManager.connect(user).createCampaign(
        name,
        description,
        startTime,
        endTime,
        { value: creationFee }
      );
    });

    it("Should return correct campaigns count", async function () {
      const count = await campaignManager.getCampaignsCount();
      expect(count).to.equal(1);
    });

    it("Should check if campaign is active correctly", async function () {
      // Campaign should not be active yet (starts in 1 hour)
      const isActive = await campaignManager.isCampaignActive(0);
      expect(isActive).to.equal(false);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to set creation fee", async function () {
      const newFee = ethers.parseEther("0.002");
      await campaignManager.connect(owner).setCreationFee(newFee);
      
      const fee = await campaignManager.getCreationFee();
      expect(fee).to.equal(newFee);
    });

    it("Should not allow non-owner to set creation fee", async function () {
      const newFee = ethers.parseEther("0.002");
      
      await expect(
        campaignManager.connect(user).setCreationFee(newFee)
      ).to.be.revertedWith("Only owner");
    });

    it("Should allow owner to authorize contracts", async function () {
      await campaignManager.connect(owner).setAuthorizedContract(user.address, true);
      
      const isAuthorized = await campaignManager.authorizedContracts(user.address);
      expect(isAuthorized).to.equal(true);
    });
  });
});