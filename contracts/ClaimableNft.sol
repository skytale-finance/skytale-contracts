//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract ClaimableNft is ERC721URIStorage, ERC721Enumerable, Ownable  {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
     
     struct AllowedUsers {
        bool isAllowed ; // is user allowed to mint or not
    }
    
    //   campaignID
    uint256 public campaignId;

     // users maps
     mapping(address => bool)public usersMap;

    
    string public baseTokenURI;
    
    constructor(uint256 _eventId,string memory _name,string memory _symbol,string memory baseURI)ERC721(_name,_symbol) {
         campaignId=_eventId;
         setBaseURI(baseURI);
        }
    
  
    
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
    
    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    // add single user to mint NFT
     function addUserToMint(address _beneficiary)public onlyOwner{
       require(!usersMap[_beneficiary],"User already Added");
       usersMap[_beneficiary]=true;
     }

// add bulk user to allow to mint nFTs
     function addBulkUser(address[] memory _beneficiary)public onlyOwner{
         for(uint256 i=0;i<_beneficiary.length;i++){
             if(usersMap[_beneficiary[i]])
             {
            continue;
             }
             usersMap[_beneficiary[i]]=true;
        }
     }
    
    // check user allowed to mint or not 
   modifier checkIsAllowedToMint() {
       require(usersMap[msg.sender] == true,"Not allowed to mint");
       _;
   }

      function mintNFT(string memory uri)  checkIsAllowedToMint public  returns (uint256)
   {
       _tokenIds.increment();

       uint256 newItemId = _tokenIds.current();
       _safeMint(msg.sender, newItemId);
       _setTokenURI(newItemId, uri);
       usersMap[msg.sender]=false;
       return newItemId;
   }
    
    function getTokenUri(address _owner) external view returns (uint[] memory) {

        uint tokenCount = balanceOf(_owner);
        uint[] memory tokensId = new uint256[](tokenCount);

        for (uint i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokensId;
    }

    function burnNFT(uint256 tokenId) public {
       _burn(tokenId);
   }

function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

function safeMint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
    
  
    
}